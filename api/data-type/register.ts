import { User } from './users.js'

export function isValidPassword(password:any) {
    // Define a regular expression pattern
    const regex = /^(?=.*[A-Z])(?=.*[a-zA-Z0-9]{3,}).{8,}$/;
  
    // Test if the password matches the pattern
    return regex.test(password);
}
export function isValidTaiwanNationalID(nid:string) {
    // Check if the ID has the correct format
    nid = nid.toUpperCase();
    const regex = /^[A-Z][1-2]\d{8}$/;
    if (!regex.test(nid.toUpperCase())) {
        return false;
    }
  
    // Define weights for the checksum calculation
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1];
  
    // Extract the first nine digits
    const digits = nid.slice(1, 10).split('').map(Number);
  
    // Calculate the weighted sum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const product = digits[i] * weights[i];
        sum += Math.floor(product / 10) + (product % 10);
    }
  
    // Calculate the checksum digit
    const checksum = (10 - (sum % 10)) % 10;
  
    // Compare with the provided checksum digit
    return checksum === Number(nid[10]);
}
export function isValidNewResidentID(nid:string) {
    // Check if the ID has the correct format
    nid = nid.toUpperCase();
    const regex = /^[A-Z][8-9]\d{8}$/;
    if (!regex.test(nid)) {
        return false;
    }
  
    // Define weights for the checksum calculation
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1];
  
    // Extract the first nine digits
    const digits = nid.slice(1, 10).split('').map(Number);
  
    // Calculate the weighted sum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const product = digits[i] * weights[i];
        sum += Math.floor(product / 10) + (product % 10);
    }
  
    // Calculate the checksum digit
    const checksum = (10 - (sum % 10)) % 10;
  
    // Compare with the provided checksum digit
    return checksum === Number(nid[10]);
}