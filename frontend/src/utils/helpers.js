// Helper utilities for formatting and UI

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Get user initials for avatar
export const getUserInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get styles for primary color
export const getStyles = () => {
  const primaryColor = "rgb(153, 214, 220)";
  return {
    bgPrimary: { backgroundColor: primaryColor },
    textPrimary: { color: primaryColor },
    hoverTextPrimary: { color: 'rgb(100, 180, 190)' },
    borderPrimary: { borderColor: primaryColor },
    primaryColor
  };
};

export default {
  formatDate,
  getUserInitials,
  getStyles
}; 