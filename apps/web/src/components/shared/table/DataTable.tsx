import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./DataTablePagination"
import { DataTableToolbar } from "./DataTableToolbar"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Server-side pagination props
  pageCount?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  pageIndex?: number
  pageSize?: number
  // Server-side sorting
  onSortingChange?: (sorting: SortingState) => void
  sorting?: SortingState
  // Selection
  onRowSelectionChange?: (rowSelection: any) => void
  rowSelection?: any
  // Column filters
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  columnFilters?: ColumnFiltersState
  // Search/Filters Props
  searchColumn?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  facetedFilters?: {
    column: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  onFilterReset?: () => void
  // Custom toolbar elements
  toolbarActions?: React.ReactNode
  // Click handler
  onRowClick?: (row: TData) => void
  // Row ID
  getRowId?: (row: TData) => string
  // Display options
  showToolbar?: boolean
  showPagination?: boolean
  isLoading?: boolean
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPaginationChange,
  pageIndex = 0,
  pageSize = 10,
  onSortingChange,
  sorting: propSorting,
  onRowSelectionChange,
  rowSelection: propRowSelection,
  onColumnFiltersChange,
  columnFilters: propColumnFilters,
  searchColumn,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  facetedFilters,
  onFilterReset,
  toolbarActions,
  onRowClick,
  getRowId,
  showToolbar = true,
  showPagination = true,
  isLoading = false,
  className,
}: DataTableProps<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])

  const rowSelection = propRowSelection ?? internalRowSelection
  const setRowSelection = onRowSelectionChange ?? setInternalRowSelection
  const sorting = propSorting ?? internalSorting
  const columnFilters = propColumnFilters ?? internalColumnFilters

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      if (onSortingChange) {
        onSortingChange(typeof updater === 'function' ? updater(sorting) : updater)
      } else {
        setInternalSorting(updater)
      }
    },
    onPaginationChange: (updater) => {
      if (onPaginationChange) {
        const nextState = typeof updater === 'function' 
          ? updater({ pageIndex, pageSize }) 
          : updater
        onPaginationChange(nextState.pageIndex, nextState.pageSize)
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: (updater) => {
      if (onColumnFiltersChange) {
        onColumnFiltersChange(typeof updater === 'function' ? updater(columnFilters) : updater)
      } else {
        setInternalColumnFilters(updater)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pageCount,
    getRowId,
  })

  // Skeleton Count based on pageSize
  const skeletonRows = React.useMemo(() => Array.from({ length: pageSize }), [pageSize])

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showToolbar && (
        <DataTableToolbar 
          table={table} 
          searchColumn={searchColumn}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          facetedFilters={facetedFilters}
          onReset={onFilterReset}
          actions={toolbarActions}
        />
      )}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm transition-all duration-300 ring-1 ring-border/5">
        <Table className="relative">
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className="h-11 font-semibold text-foreground/70">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading State: Skeletons
              skeletonRows.map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-border/40 h-16">
                  {columns.map((_, j) => (
                    <TableCell key={`cell-${i}-${j}`} className="py-4">
                      <div className="h-5 animate-pulse rounded-md bg-muted/60" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Data State
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "group transition-colors h-16 border-border/40",
                    onRowClick ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/10",
                    "animate-in fade-in slide-in-from-top-1 duration-300"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty State
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[400px] text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-4 rounded-full bg-muted/40 border border-border/10 shadow-inner">
                      <svg className="h-10 w-10 text-muted-foreground opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-foreground/80">Không tìm thấy kết quả</p>
                      <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm để thu hẹp kết quả</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && <DataTablePagination table={table} />}
    </div>
  )
}
