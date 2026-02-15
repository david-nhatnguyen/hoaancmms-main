"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      icons={{
        success: <CircleCheck className="h-4 w-4 text-green-500" />,
        info: <Info className="h-4 w-4 text-blue-500" />,
        warning: <TriangleAlert className="h-4 w-4 text-yellow-500" />,
        error: <OctagonX className="h-4 w-4 text-destructive" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: 
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:hover:bg-muted group-[.toast]:transition-colors group-[.toast]:opacity-100 group-[.toast]:text-foreground/50 group-[.toast]:hover:text-foreground group-[.toast]:!left-auto group-[.toast]:!right-0 group-[.toast]:translate-x-1/3 group-[.toast]:-translate-y-1/3",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
