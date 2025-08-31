"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Activity, BarChart, File, LayoutGrid, Map, Settings } from "lucide-react"

const navItems = [
    { href: "#", icon: LayoutGrid, label: "Overview" },
    { href: "#", icon: Activity, label: "KPIs" },
    { href: "#", icon: BarChart, label: "Trends" },
    { href: "#", icon: Map, label: "Location Map" },
    { href: "#", icon: File, label: "Data Upload" },
];

export default function MainNav({ isCollapsed }: { isCollapsed: boolean }) {
    const pathname = usePathname();

    const renderLink = (item: typeof navItems[0], index: number) => {
        const isActive = pathname === item.href;
        const linkContent = (
             <Link
                href={item.href}
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    isActive && "bg-accent text-accent-foreground"
                )}
            >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
            </Link>
        );

        if (isCollapsed) {
            return (
                 <Tooltip key={index}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
            );
        }

        return (
             <div key={index} className="flex items-center">
                {linkContent}
                 <span className="ml-4 font-medium">{item.label}</span>
            </div>
        );
    }


    return (
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                {navItems.map(renderLink)}
            </nav>
        </TooltipProvider>
    );
}
