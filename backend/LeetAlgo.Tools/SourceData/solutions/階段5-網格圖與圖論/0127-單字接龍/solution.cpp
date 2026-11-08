// 把每個單字當成節點，只差一個字母的兩個單字之間有邊，題目就變成在這張隱含圖上求最短路，用 BFS。
// 不先把圖建出來，而是走到一個單字時，把它每個位置換成 a 到 z，看換完的字在不在字典裡，在的話就是鄰居。
// 字典裡的字被走到就從集合移除，等於標記走過，之後不會再進佇列。
// 時間 O(N * L^2 * 26)，空間 O(N * L)，N 是字典大小、L 是單字長度。
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> unvisited(wordList.begin(), wordList.end());
        if (unvisited.count(endWord) == 0) {
            return 0;
        }
        unvisited.erase(beginWord);

        queue<string> words;
        words.push(beginWord);
        int wordCount = 1;
        while (!words.empty()) {
            wordCount++;
            int levelSize = words.size();
            for (int k = 0; k < levelSize; k++) {
                string word = words.front();
                words.pop();
                int length = word.size();
                for (int position = 0; position < length; position++) {
                    char original = word[position];
                    for (char letter = 'a'; letter <= 'z'; letter++) {
                        word[position] = letter;
                        if (unvisited.count(word) == 0) {
                            continue;
                        }
                        if (word == endWord) {
                            return wordCount;
                        }
                        unvisited.erase(word);
                        words.push(word);
                    }
                    word[position] = original;
                }
            }
        }
        return 0;
    }
};
