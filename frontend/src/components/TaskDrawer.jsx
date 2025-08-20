import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const TaskDrawer = ({ open, onClose, task, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h2>
              <button onClick={onClose}><X className="w-5 h-5" /></button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TaskDrawer


