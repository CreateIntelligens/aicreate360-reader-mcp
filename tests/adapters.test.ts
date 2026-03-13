import { beforeEach, describe, expect, it, vi } from "vitest"

const fixtures = {
  setn: `
快訊
[收盤／台股下殺532點 題材股各自表現！ 13:00](https://setn.com/news1)
[影／阿曼油槽遇襲！炸出蘑菇雲 13:01](https://setn.com/news2)
三立新聞網 SETN.COM | 一網能知天下事 一鍵開啟新視野
[熱門新聞]
* [**熱門標題一**](https://setn.com/hot1)
* [更多](https://setn.com/more)
[最新影音]
`,
  ctitv: `
*   [綜藝OK啦](https://www.ctitv.com.tw/channel36/ok)
*   [唱歌給你聽](https://www.ctitv.com.tw/channel36/sing)
*   [周玉琴](https://www.ctitv.com.tw/anchor/stephanie)
### [中天倫理委員會 一一四年 第四次倫理委員會議 會議記錄](https://www.ctitv.com.tw/about-cti/cti-ethics-committee/2026/01/24191 "record")
### [【中天電視】115年2月客服暨申訴案明細表](https://www.ctitv.com.tw/about-cti/cti-customer-complaint/2026/03/24597 "complaint")
### [中天電視聲明 2022-07-27](https://www.ctitv.com.tw/announce/2022/07/11063 "announcement")
`,
  bestshop: `
[節目聯名系列](https://bestshop.setddg.com/CATE02001)
-----------------------------------------------
*   [![Image 1](https://attach.setddg.com/a.jpeg)](https://bestshop.setddg.com/PM1)
    [##### 台灣四神獸系列厚磅內刷毛帽T](https://bestshop.setddg.com/PM1)
    #### 1,380
[美食](https://bestshop.setddg.com/CATE01442)
-------------------------------------------
*   [![Image 2](https://attach.setddg.com/b.jpeg)](https://bestshop.setddg.com/PM2)
    [##### 阿胖師職人級風味泡菜8包](https://bestshop.setddg.com/PM2)
    #### 980
[居家](https://bestshop.setddg.com/CATE01440)
-------------------------------------------
*   [![Image 3](https://attach.setddg.com/c.jpeg)](https://bestshop.setddg.com/PM3)
    [##### 羊駝絨超導被](https://bestshop.setddg.com/PM3)
    #### 9,900
[服飾](https://bestshop.setddg.com/CATE01438)
-------------------------------------------
*   [![Image 4](https://attach.setddg.com/d.jpeg)](https://bestshop.setddg.com/PM4)
    [##### 石墨烯循環能量巾](https://bestshop.setddg.com/PM4)
    #### 778
`
}

const fetchSourceMarkdown = vi.fn<(source: "setn" | "ctitv" | "bestshop") => Promise<string>>()

vi.mock("../src/services/source-fetcher.js", () => ({
  fetchSourceMarkdown
}))

describe("source adapters", () => {
  beforeEach(() => {
    fetchSourceMarkdown.mockImplementation(async (source) => fixtures[source])
  })

  it("lists available adapters", async () => {
    const { adapters, getAdapter } = await import("../src/adapters/index.js")
    expect(Object.keys(adapters)).toEqual(["setn", "ctitv", "bestshop"])
    expect(getAdapter("setn").summary.title).toBe("SETN")
  })

  it("parses SETN items and supports item lookup", async () => {
    const { setnAdapter } = await import("../src/adapters/setn.js")

    expect(setnAdapter.listSections()).toEqual(["快訊", "熱門新聞"])

    const result = await setnAdapter.listItems({ limit: 5, offset: 0 })
    expect(result.total).toBe(3)
    expect(result.items[0]?.section).toBe("快訊")

    const first = result.items[0]
    expect(first?.timestampText).toMatch(/\d{1,2}:\d{2}/)
    await expect(setnAdapter.getItemByUrl(first!.url)).resolves.toEqual(first)
    await expect(setnAdapter.getItemByUrl("https://example.com/missing")).resolves.toBeNull()
  })

  it("filters SETN items by section", async () => {
    const { setnAdapter } = await import("../src/adapters/setn.js")
    const result = await setnAdapter.listItems({ section: "熱門新聞", limit: 5, offset: 0 })

    expect(result.total).toBe(1)
    expect(result.items.every((item) => item.section === "熱門新聞")).toBe(true)
  })

  it("skips SETN section landing pages and keeps only actual stories", async () => {
    fetchSourceMarkdown.mockResolvedValueOnce(`
[熱門新聞](https://www.setn.com/ViewAll.aspx?PageGroupID=0)
* [**熱門標題一**](https://setn.com/hot1)
* [**熱門標題二**](https://setn.com/hot2)
[最新影音]
`)

    const { setnAdapter } = await import("../src/adapters/setn.js")
    const result = await setnAdapter.listItems({ section: "熱門新聞", limit: 10, offset: 0 })

    expect(result.total).toBe(2)
    expect(result.items.map((item) => item.title)).toEqual(["熱門標題一", "熱門標題二"])
    expect(result.items.some((item) => item.url.includes("ViewAll.aspx"))).toBe(false)
  })

  it("deduplicates SETN items and tolerates missing sections", async () => {
    fetchSourceMarkdown.mockResolvedValueOnce(`
快訊
[重複標題 12:00](https://setn.com/repeat)
[重複標題 12:00](https://setn.com/repeat)
`)

    const { setnAdapter } = await import("../src/adapters/setn.js")
    const result = await setnAdapter.listItems({ limit: 10, offset: 0 })

    expect(result.total).toBe(1)
    expect(result.items[0]?.title).toBe("重複標題")
  })

  it("parses CTITV sections and lookups", async () => {
    const { ctitvAdapter } = await import("../src/adapters/ctitv.js")
    expect(ctitvAdapter.listSections()).toEqual([
      "programs",
      "anchors",
      "ethics",
      "complaints",
      "announcements"
    ])

    const result = await ctitvAdapter.listItems({ section: "anchors", limit: 10, offset: 0 })
    expect(result.total).toBe(1)
    expect(result.items.every((item) => item.section === "anchors")).toBe(true)

    await expect(ctitvAdapter.getItemByUrl(result.items[0]!.url)).resolves.toEqual(result.items[0])
  })

  it("skips ignored CTITV titles and deduplicates matches", async () => {
    fetchSourceMarkdown.mockResolvedValueOnce(`
*   [中天電視](https://www.ctitv.com.tw/channel36/ignore)
*   [綜藝OK啦](https://www.ctitv.com.tw/channel36/ok)
*   [綜藝OK啦](https://www.ctitv.com.tw/channel36/ok)
`)

    const { ctitvAdapter } = await import("../src/adapters/ctitv.js")
    const result = await ctitvAdapter.listItems({ section: "programs", limit: 10, offset: 0 })

    expect(result.total).toBe(1)
    expect(result.items[0]?.title).toBe("綜藝OK啦")
  })

  it("parses Bestshop products with prices and section filters", async () => {
    const { bestshopAdapter } = await import("../src/adapters/bestshop.js")
    expect(bestshopAdapter.listSections()).toEqual(["節目聯名系列", "美食", "居家", "服飾"])

    const result = await bestshopAdapter.listItems({ section: "美食", limit: 10, offset: 0 })
    expect(result.total).toBe(1)
    expect(result.items.every((item) => item.section === "美食")).toBe(true)
    expect(typeof result.items[0]?.price).toBe("number")

    await expect(bestshopAdapter.getItemByUrl(result.items[0]!.url)).resolves.toEqual(
      result.items[0]
    )
  })

  it("tolerates missing Bestshop sections", async () => {
    fetchSourceMarkdown.mockResolvedValueOnce(`
[節目聯名系列](https://bestshop.setddg.com/CATE02001)
-----------------------------------------------
*   [![Image 1](https://attach.setddg.com/a.jpeg)](https://bestshop.setddg.com/PM1)
    [##### 台灣四神獸系列厚磅內刷毛帽T](https://bestshop.setddg.com/PM1)
    #### 1,380
`)

    const { bestshopAdapter } = await import("../src/adapters/bestshop.js")
    const result = await bestshopAdapter.listItems({ limit: 10, offset: 0 })

    expect(result.total).toBe(1)
    expect(result.items[0]?.section).toBe("節目聯名系列")
  })
})
