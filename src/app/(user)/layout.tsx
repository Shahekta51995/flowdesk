import UserSidebar from "@/components/ui/UserSidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", height: "100vh",
      overflow: "hidden", backgroundColor: "#0f1117"
    }}>
      <UserSidebar />
      <main style={{
        marginLeft: "240px", flex: 1,
        display: "flex", flexDirection: "column",
        overflow: "hidden", minWidth: 0
      }}>
        {children}
      </main>
    </div>
  );
}