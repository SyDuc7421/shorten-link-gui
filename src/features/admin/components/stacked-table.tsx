import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/*
 * One markup tree for every admin list (DESIGN.md §8.1, §8.2): below md each
 * row is a stacked card whose cells carry their own label; from md it is a
 * plain table row under a visible header.
 */

export function StackedTable({ className, ...props }: React.ComponentProps<typeof Table>) {
  return <Table className={cn('flex flex-col md:table', className)} {...props} />;
}

export function StackedTableHeader(props: React.ComponentProps<typeof TableHeader>) {
  return <TableHeader className="hidden md:table-header-group" {...props} />;
}

interface StackedTableHeadProps extends React.ComponentProps<typeof TableHead> {
  /** Numbers align right (DESIGN.md §14). */
  isNumeric?: boolean;
}

export function StackedTableHead({
  isNumeric = false,
  className,
  ...props
}: StackedTableHeadProps) {
  return <TableHead className={cn(isNumeric && 'text-right', className)} {...props} />;
}

export function StackedTableBody({ className, ...props }: React.ComponentProps<typeof TableBody>) {
  return (
    <TableBody className={cn('flex flex-col gap-3 md:table-row-group', className)} {...props} />
  );
}

export function StackedTableRow({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-4 hover:bg-card md:table-row md:rounded-none md:border-0 md:border-b md:bg-transparent md:p-0 md:hover:bg-muted/50',
        className,
      )}
      {...props}
    />
  );
}

interface StackedTableCellProps extends React.ComponentProps<typeof TableCell> {
  /** Shown below md, where the header is hidden. Omit on the row's title cell. */
  label?: string;
  /** Numbers align right in the table layout (DESIGN.md §14). */
  isNumeric?: boolean;
}

export function StackedTableCell({
  label,
  isNumeric = false,
  className,
  children,
  ...props
}: StackedTableCellProps) {
  return (
    <TableCell
      className={cn(
        'flex min-w-0 items-center justify-between gap-4 p-0 whitespace-normal md:table-cell md:p-2',
        isNumeric && 'md:text-right',
        className,
      )}
      {...props}
    >
      {label ? (
        <span className="shrink-0 text-xs font-medium text-muted-foreground md:hidden">
          {label}
        </span>
      ) : null}
      {children}
    </TableCell>
  );
}

const SKELETON_ROWS = ['a', 'b', 'c', 'd', 'e'];

/** Rows with the real column count, so the list does not jump when data lands. */
export function StackedTableSkeleton({ columns }: { columns: readonly string[] }) {
  return (
    <StackedTable aria-busy="true">
      <StackedTableHeader>
        <TableRow>
          {columns.map((column) => (
            <StackedTableHead key={column}>{column}</StackedTableHead>
          ))}
        </TableRow>
      </StackedTableHeader>
      <StackedTableBody>
        {SKELETON_ROWS.map((row) => (
          <StackedTableRow key={row}>
            {columns.map((column) => (
              <StackedTableCell key={column}>
                <Skeleton className="h-5 w-full max-w-40" />
              </StackedTableCell>
            ))}
          </StackedTableRow>
        ))}
      </StackedTableBody>
    </StackedTable>
  );
}
