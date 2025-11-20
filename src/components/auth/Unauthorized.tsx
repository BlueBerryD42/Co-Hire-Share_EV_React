import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface UnauthorizedProps {
  message?: string
  requiredRole?: string
}

/**
 * Unauthorized component - shown when user doesn't have required role
 */
const Unauthorized = ({ 
  message = "You don't have permission to access this page.",
  requiredRole 
}: UnauthorizedProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center p-8">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-accent-terracotta"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          Access Denied
        </h2>
        <p className="text-neutral-600 mb-2">{message}</p>
        {requiredRole && (
          <p className="text-sm text-neutral-500 mb-6">
            Required role: <span className="font-semibold">{requiredRole}</span>
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Link to="/home">
            <Button variant="accent">Go to Home</Button>
          </Link>
          <Link to="/admin/dashboard">
            <Button>Admin Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default Unauthorized

