// 猜了 guessWord 得到 matches 之後，秘密單字和 guessWord 的吻合位置數一定剛好是 matches，
// 所以只留下「和 guessWord 吻合數也等於 matches」的候選字，其他都不可能是答案。
// 每次要猜哪個字：把剩下的候選字依「和這個字的吻合數」分組，最大那組就是猜它之後最壞會剩下的數量，
// 從所有單字中挑最壞情況最小的那個來猜（極小化極大），讓每一次猜測都盡量縮小範圍。
// 先看候選字、再看其他單字，而且只有嚴格更好才換，所以一樣好時會選到還可能是答案的候選字。
// 每次挑字 O(n * m * 6)，m 是剩下的候選字數，最多猜 allowedGuesses 次；空間 O(n)。
class Solution {
private:
    int countMatches(const string& first, const string& second) {
        int matches = 0;
        for (int i = 0; i < 6; i++) {
            if (first[i] == second[i]) {
                matches++;
            }
        }
        return matches;
    }

    int worstCaseRemaining(const string& word, vector<string>& candidates) {
        vector<int> groupSizes(7, 0);
        for (const string& other : candidates) {
            groupSizes[countMatches(word, other)]++;
        }
        return *max_element(groupSizes.begin(), groupSizes.end());
    }

    string pickGuess(vector<string>& words, vector<string>& candidates) {
        string bestWord = candidates[0];
        int bestWorstCase = candidates.size() + 1;
        for (const string& word : candidates) {
            int worstCase = worstCaseRemaining(word, candidates);
            if (worstCase < bestWorstCase) {
                bestWorstCase = worstCase;
                bestWord = word;
            }
        }
        for (const string& word : words) {
            int worstCase = worstCaseRemaining(word, candidates);
            if (worstCase < bestWorstCase) {
                bestWorstCase = worstCase;
                bestWord = word;
            }
        }
        return bestWord;
    }

public:
    void findSecretWord(vector<string>& words, Master& master) {
        vector<string> candidates = words;
        while (!candidates.empty()) {
            string guessWord = pickGuess(words, candidates);
            int matches = master.guess(guessWord);
            if (matches == 6) {
                return;
            }
            vector<string> remaining;
            for (const string& word : candidates) {
                if (countMatches(word, guessWord) == matches) {
                    remaining.push_back(word);
                }
            }
            candidates = remaining;
        }
    }
};
