// 左右兩個指針從兩端往中間走，遇到不是字母或數字的字元就跳過，
// 兩邊都停在字母或數字上時，轉成小寫比較，不同就不是回文。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public bool IsPalindrome(string s) {
        int left = 0;
        int right = s.Length - 1;
        while (left < right) {
            if (!char.IsLetterOrDigit(s[left])) {
                left++;
            } else if (!char.IsLetterOrDigit(s[right])) {
                right--;
            } else if (char.ToLower(s[left]) != char.ToLower(s[right])) {
                return false;
            } else {
                left++;
                right--;
            }
        }
        return true;
    }
}
