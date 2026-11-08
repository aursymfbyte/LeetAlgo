// 猜了 guessWord 得到 matches 之後，秘密單字和 guessWord 的吻合位置數一定剛好是 matches，
// 所以只留下「和 guessWord 吻合數也等於 matches」的候選字，其他都不可能是答案。
// 每次要猜哪個字：把剩下的候選字依「和這個字的吻合數」分組，最大那組就是猜它之後最壞會剩下的數量，
// 從所有單字中挑最壞情況最小的那個來猜（極小化極大），讓每一次猜測都盡量縮小範圍。
// 先看候選字、再看其他單字，而且只有嚴格更好才換，所以一樣好時會選到還可能是答案的候選字。
// 每次挑字 O(n * m * 6)，m 是剩下的候選字數，最多猜 allowedGuesses 次；空間 O(n)。
class Solution {
    public void FindSecretWord(string[] words, Master master) {
        List<string> candidates = new List<string>(words);
        while (candidates.Count > 0) {
            string guessWord = PickGuess(words, candidates);
            int matches = master.Guess(guessWord);
            if (matches == 6) {
                return;
            }
            List<string> remaining = new List<string>();
            foreach (string word in candidates) {
                if (CountMatches(word, guessWord) == matches) {
                    remaining.Add(word);
                }
            }
            candidates = remaining;
        }
    }

    private string PickGuess(string[] words, List<string> candidates) {
        string bestWord = candidates[0];
        int bestWorstCase = candidates.Count + 1;
        foreach (string word in candidates.Concat(words)) {
            int worstCase = WorstCaseRemaining(word, candidates);
            if (worstCase < bestWorstCase) {
                bestWorstCase = worstCase;
                bestWord = word;
            }
        }
        return bestWord;
    }

    private int WorstCaseRemaining(string word, List<string> candidates) {
        int[] groupSizes = new int[7];
        foreach (string other in candidates) {
            groupSizes[CountMatches(word, other)]++;
        }
        return groupSizes.Max();
    }

    private int CountMatches(string first, string second) {
        int matches = 0;
        for (int i = 0; i < 6; i++) {
            if (first[i] == second[i]) {
                matches++;
            }
        }
        return matches;
    }
}
