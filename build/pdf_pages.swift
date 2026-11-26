// Rasterise every page of a PDF to PNG with macOS PDFKit (no browser needed).
// usage: swift pdf_pages.swift <in.pdf> <outdir> <widthPx>
import PDFKit
import AppKit

let args = CommandLine.arguments
guard args.count >= 4, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else { print("usage: in.pdf outdir width"); exit(1) }
let outDir = args[2]
let targetW = CGFloat(Double(args[3]) ?? 1100)
for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let scale = targetW / box.width
    let size = NSSize(width: box.width * scale, height: box.height * scale)
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size.width), pixelsHigh: Int(size.height), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    let ctx = NSGraphicsContext(bitmapImageRep: rep)!
    NSGraphicsContext.current = ctx
    let cg = ctx.cgContext
    cg.setFillColor(NSColor.white.cgColor); cg.fill(CGRect(origin: .zero, size: size))
    cg.scaleBy(x: scale, y: scale)
    page.draw(with: .mediaBox, to: cg)
    NSGraphicsContext.restoreGraphicsState()
    let png = rep.representation(using: .png, properties: [:])!
    try! png.write(to: URL(fileURLWithPath: String(format: "%@/p%02d.png", outDir, i)))
}
print("pages:", doc.pageCount)
