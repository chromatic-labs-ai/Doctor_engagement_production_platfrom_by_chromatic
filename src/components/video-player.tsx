export function VideoPlayer({ url }: { url: string }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <video controls className="w-full">
        <source src={url} />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
