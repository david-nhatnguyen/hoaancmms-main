import { type Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./DataTableViewOptions"
import { DataTableFacetedFilter } from "./DataTableFacetedFilter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  // For external state
  searchValue?: string
  onSearchChange?: (value: string) => void
  // Faceted filters
  facetedFilters?: {
    column: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  // For external reset
  onReset?: () => void
  actions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  facetedFilters = [],
  onReset,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || (searchValue !== undefined && searchValue !== "")

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {searchColumn && (onSearchChange || table.getColumn(searchColumn)) && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue ?? (table.getColumn(searchColumn)?.getFilterValue() as string ?? "")}
            onChange={(event) => {
              if (onSearchChange) {
                onSearchChange(event.target.value)
              } else {
                table.getColumn(searchColumn)?.setFilterValue(event.target.value)
              }
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {facetedFilters.map((filter) => 
          table.getColumn(filter.column) && (
            <DataTableFacetedFilter
              key={filter.column}
              column={table.getColumn(filter.column)}
              title={filter.title}
              options={filter.options}
            />
          )
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
