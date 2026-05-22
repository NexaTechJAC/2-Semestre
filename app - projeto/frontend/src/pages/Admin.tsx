import { Link } from "react-router-dom"
import SidebarADM from "../components/SidebarADM"

export default function Admin() {
  return (
    <main className="min-h-screen bg-[#f4f4f5] p-4 sm:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <SidebarADM />
      </div>
    </main>
  )
}
