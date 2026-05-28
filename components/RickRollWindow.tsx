export default function RickRollWindow() {
  return (
    <div className="h-full w-full">
      <iframe
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-full h-full"
        style={{ border: "none", display: "block" }}
      />
    </div>
  );
}
