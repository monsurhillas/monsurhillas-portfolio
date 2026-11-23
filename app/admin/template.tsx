// A template (unlike a layout) remounts on every navigation, so each admin
// page fades up smoothly as you move between sections.
export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="reveal" style={{ animationDuration: "0.35s" }}>{children}</div>;
}
