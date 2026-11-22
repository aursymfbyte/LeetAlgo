export function heapPush<T>(heap: T[], item: T, above: (a: T, b: T) => boolean) {
  let index = heap.length;
  let compared = 0;
  heap.push(item);

  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    compared++;
    if (!above(item, heap[parent])) {
      break;
    }
    heap[index] = heap[parent];
    heap[parent] = item;
    index = parent;
  }
  return compared;
}

export function heapPop<T>(heap: T[], above: (a: T, b: T) => boolean) {
  const last = heap.pop() as T;
  let compared = 0;
  if (heap.length === 0) {
    return compared;
  }

  let index = 0;
  heap[0] = last;
  while (index * 2 + 1 < heap.length) {
    const left = index * 2 + 1;
    const right = index * 2 + 2;
    let child = left;
    if (right < heap.length) {
      compared++;
      if (above(heap[right], heap[left])) {
        child = right;
      }
    }
    compared++;
    if (!above(heap[child], last)) {
      break;
    }
    heap[index] = heap[child];
    heap[child] = last;
    index = child;
  }
  return compared;
}

export function sortCount<T>(items: T[], before: (a: T, b: T) => boolean) {
  let compared = 0;
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    let j = i - 1;
    while (j >= 0) {
      compared++;
      if (!before(item, items[j])) {
        break;
      }
      items[j + 1] = items[j];
      j--;
    }
    items[j + 1] = item;
  }
  return compared;
}
