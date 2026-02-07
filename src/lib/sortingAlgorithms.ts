export type SortActionType = "compare" | "swap" | "overwrite";

export interface SortStep {
    type: SortActionType;
    indices: number[]; // e.g. [i, j] for compare/swap, [k] for overwrite
    value?: number; // value to overwrite at index k
}

export function* bubbleSort(array: number[]): Generator<SortStep> {
    const arr = [...array];
    const n = arr.length;
    let swapped;
    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            yield { type: "compare", indices: [j, j + 1] };
            if (arr[j] > arr[j + 1]) {
                yield { type: "swap", indices: [j, j + 1] };
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

export function* selectionSort(array: number[]): Generator<SortStep> {
    const arr = [...array];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            yield { type: "compare", indices: [minIdx, j] };
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            yield { type: "swap", indices: [i, minIdx] };
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
}

export function* insertionSort(array: number[]): Generator<SortStep> {
    const arr = [...array];
    const n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        yield { type: "compare", indices: [j, i] }; // compare key with previous
        while (j >= 0 && arr[j] > key) {
            yield { type: "compare", indices: [j, j + 1] }; // visualize comparison
            yield { type: "overwrite", indices: [j + 1], value: arr[j] }; // shift
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        yield { type: "overwrite", indices: [j + 1], value: key }; // insert key
        arr[j + 1] = key;
    }
}

export function* mergeSort(array: number[]): Generator<SortStep> {
    const arr = [...array];
    yield* mergeSortHelper(arr, 0, arr.length - 1);
}

function* mergeSortHelper(
    arr: number[],
    l: number,
    r: number
): Generator<SortStep> {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    yield* mergeSortHelper(arr, l, m);
    yield* mergeSortHelper(arr, m + 1, r);
    yield* merge(arr, l, m, r);
}

function* merge(
    arr: number[],
    l: number,
    m: number,
    r: number
): Generator<SortStep> {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0,
        j = 0,
        k = l;

    while (i < n1 && j < n2) {
        yield { type: "compare", indices: [l + i, m + 1 + j] }; // compare from original positions roughly
        if (L[i] <= R[j]) {
            yield { type: "overwrite", indices: [k], value: L[i] };
            arr[k] = L[i];
            i++;
        } else {
            yield { type: "overwrite", indices: [k], value: R[j] };
            arr[k] = R[j];
            j++;
        }
        k++;
    }

    while (i < n1) {
        yield { type: "overwrite", indices: [k], value: L[i] };
        arr[k] = L[i];
        i++;
        k++;
    }

    while (j < n2) {
        yield { type: "overwrite", indices: [k], value: R[j] };
        arr[k] = R[j];
        j++;
        k++;
    }
}

export function* quickSort(array: number[]): Generator<SortStep> {
    const arr = [...array];
    yield* quickSortHelper(arr, 0, arr.length - 1);
}

function* quickSortHelper(
    arr: number[],
    low: number,
    high: number
): Generator<SortStep> {
    if (low < high) {
        const pi = yield* partition(arr, low, high);
        yield* quickSortHelper(arr, low, pi - 1);
        yield* quickSortHelper(arr, pi + 1, high);
    }
}

function* partition(
    arr: number[],
    low: number,
    high: number
): Generator<any> { // SortStep + return value
    const pivot = arr[high]; // pivot
    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
        yield { type: "compare", indices: [j, high] };
        if (arr[j] < pivot) {
            i++;
            yield { type: "swap", indices: [i, j] };
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    yield { type: "swap", indices: [i + 1, high] };
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}
