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
    pageCount: pageCount,
    getRowId,
  })

  return (
    <div className="flex flex-col gap-4">
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
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
