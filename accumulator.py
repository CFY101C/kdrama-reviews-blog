class Accumulator:
    def __init__(self):
        self._sum = 0
        self._count = 0

    def add(self, value):
        self._sum += value
        self._count += 1
        return self._sum

    @property
    def sum(self):
        return self._sum

    @property
    def count(self):
        return self._count

    @property
    def avg(self):
        return self._sum / self._count if self._count else 0

    def reset(self):
        self._sum = 0
        self._count = 0

    def __repr__(self):
        return f"Accumulator(sum={self._sum}, count={self._count}, avg={self.avg:.4f})"


# --- 示例 ---
if __name__ == "__main__":
    acc = Accumulator()
    for x in [1, 2, 3, 4, 5]:
        acc.add(x)
        print(f"add {x} -> {acc}")

    print(f"\nsum  : {acc.sum}")
    print(f"count: {acc.count}")
    print(f"avg  : {acc.avg:.4f}")
