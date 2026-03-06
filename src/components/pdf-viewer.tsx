export function PdfViewer({
  url,
  title = "Storyboard PDF",
}: {
  url: string;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <iframe
        title={title}
        src={url}
        className="h-[560px] w-full"
        loading="lazy"
      />
    </div>
  );
}
