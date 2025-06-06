import { useUser } from "@/app/context/user-context";
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { MenuItem } from "@/lib/api/auth";
import { formatDateTimeWithAmPm } from "@/lib/utils";
import { usePathname } from "next/navigation";


function findMenuTitleByPath(menus: MenuItem[], pathname: string): string | null {
    for (const item of menus) {
        if (pathname.startsWith(item.url)) {
            return item.title
        }
        if (item.children) {
            const found = findMenuTitleByPath(item.children, pathname)
            if (found) return found
        }
    }
    return null
}


export function SiteHeader() {

    const pathname = usePathname()
    const { user } = useUser()

    const title =
        (user?.menus ? findMenuTitleByPath(user.menus, pathname) : null) ??
        "Dashboard"

    return (
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear">
            <div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">{title}</h1>
            </div>

            {user && (
                <div className="hidden md:flex flex-col items-end text-sm text-muted-foreground px-4">
                    <span className="font-medium">
                        {user.name} · {user.roles[0].displayName}
                    </span>
                    <span className="text-xs">{formatDateTimeWithAmPm(new Date())}</span>
                </div>
            )}
        </header>
    )
}
