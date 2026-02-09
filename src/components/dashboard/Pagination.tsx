'use client'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null

  const isPrevDisabled = page <= 1
  const isNextDisabled = page >= pageCount

  return (
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={isPrevDisabled}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          isPrevDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-sm'
        }`}
      >
        Previous
      </button>
      <div className="px-4 py-2 text-gray-600 font-medium">
        Page {page} of {pageCount}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={isNextDisabled}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          isNextDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-sm'
        }`}
      >
        Next
      </button>
    </div>
  )
}
