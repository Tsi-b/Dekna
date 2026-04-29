import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      [
        // Container pill
        "inline-flex flex-wrap items-center gap-1 rounded-2xl sm:rounded-full border p-1 shadow-sm backdrop-blur",
        // Light
        "border-gray-200 bg-white/80",
        // Dark
        "dark:border-gray-800 dark:bg-gray-950/60",
      ].join(' '),
      className
    )}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        // We'll layer custom styles below, keeping buttonVariants for consistent focus/disabled.
        variant: "ghost",
        size,
      }),
      // Modern pill shape + spacing
      [
        "h-9 min-w-9 rounded-full px-2 sm:px-3 text-sm font-semibold",
        // Light
        "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        // Dark
        "dark:text-gray-200 dark:hover:bg-gray-800/60 dark:hover:text-white",
        // Focus
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
        // Disabled via aria-disabled
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
      ].join(' '),
      // Active state (accent)
      isActive &&
        [
          "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm",
          "hover:from-indigo-600 hover:to-violet-600 hover:text-white",
          "dark:from-indigo-500 dark:to-violet-500",
        ].join(' '),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-2 pl-3 pr-4", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-2 pl-4 pr-3", className)}
    {...props}
  >
    <span className="hidden sm:inline">Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn(
      [
        "flex h-9 min-w-9 items-center justify-center rounded-full px-2",
        "text-gray-400 dark:text-gray-500",
      ].join(' '),
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
