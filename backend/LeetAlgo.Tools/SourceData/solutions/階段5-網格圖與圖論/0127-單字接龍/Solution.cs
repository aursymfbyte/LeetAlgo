// 把每個單字當成節點，只差一個字母的兩個單字之間有邊，題目就變成在這張隱含圖上求最短路，用 BFS。
// 不先把圖建出來，而是走到一個單字時，把它每個位置換成 a 到 z，看換完的字在不在字典裡，在的話就是鄰居。
// 字典裡的字被走到就從集合移除，等於標記走過，之後不會再進佇列。
// 時間 O(N * L^2 * 26)，空間 O(N * L)，N 是字典大小、L 是單字長度。
public class Solution {
    public int LadderLength(string beginWord, string endWord, IList<string> wordList) {
        HashSet<string> unvisited = new HashSet<string>(wordList);
        if (!unvisited.Contains(endWord)) {
            return 0;
        }
        unvisited.Remove(beginWord);

        Queue<string> queue = new Queue<string>();
        queue.Enqueue(beginWord);
        int wordCount = 1;
        while (queue.Count > 0) {
            wordCount++;
            int levelSize = queue.Count;
            for (int k = 0; k < levelSize; k++) {
                char[] letters = queue.Dequeue().ToCharArray();
                for (int position = 0; position < letters.Length; position++) {
                    char original = letters[position];
                    for (char letter = 'a'; letter <= 'z'; letter++) {
                        letters[position] = letter;
                        string nextWord = new string(letters);
                        if (!unvisited.Contains(nextWord)) {
                            continue;
                        }
                        if (nextWord == endWord) {
                            return wordCount;
                        }
                        unvisited.Remove(nextWord);
                        queue.Enqueue(nextWord);
                    }
                    letters[position] = original;
                }
            }
        }
        return 0;
    }
}
