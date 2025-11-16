/**
 * Central export for TypeScript utility types
 *
 * NOTE: Phần lớn models nên ở src/models/ (booking, vehicle, expense, group, etc.)
 * Folder này chỉ cho utility types và helper types không phải từ backend
 */

// Re-export models để backward compatibility (tạm thời)
// TODO: Sau này có thể xóa và dùng trực tiếp @/models/vehicle, @/models/expense
export * from '@/models/vehicle'
export * from '@/models/expense'
