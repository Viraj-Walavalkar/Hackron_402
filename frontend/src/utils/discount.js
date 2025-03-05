export const calculateDiscount = (expiryDate, price) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
    if (daysUntilExpiry <= 2) {
      return price * 0.5; // 50% discount
    } else if (daysUntilExpiry <= 5) {
      return price * 0.3; // 30% discount
    } else if (daysUntilExpiry <= 7) {
      return price * 0.1; // 10% discount
    }
  
    return 0; // No discount
  };