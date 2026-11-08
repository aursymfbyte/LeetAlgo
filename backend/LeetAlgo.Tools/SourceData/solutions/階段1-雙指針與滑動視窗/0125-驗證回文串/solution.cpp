// 左右兩個指針從兩端往中間走，遇到不是字母或數字的字元就跳過，
// 兩邊都停在字母或數字上時，轉成小寫比較，不同就不是回文。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0;
        int right = s.size() - 1;
        while (left < right) {
            if (!isalnum(s[left])) {
                left++;
            } else if (!isalnum(s[right])) {
                right--;
            } else if (tolower(s[left]) != tolower(s[right])) {
                return false;
            } else {
                left++;
                right--;
            }
        }
        return true;
    }
};
