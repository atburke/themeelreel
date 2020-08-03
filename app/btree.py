import attr

import bisect


@attr.s
class BPlusTree:
    degree = attr.ib()
    root = attr.ib(init=False)

    def __attrs_post_init__(self):
        self.root = BTreeNode(self.degree, is_root=True, is_leaf=True)

    def insert(self, x, data):

        root = self.root
        if root.insert(x, data):

            midpoint = len(root) // 2
            left_child = BTreeNode(self.degree, is_leaf=root.is_leaf)
            right_child = BTreeNode(self.degree, is_leaf=root.is_leaf)

            left_child.next_leaf = right_child
            right_child.prev_leaf = left_child

            if root.is_leaf:
                left_child.indices = root.indices[:midpoint]
                left_child.children = root.children[:midpoint]
                right_child.indices = root.indices[midpoint:]
                right_child.children = root.children[midpoint:]

            else:
                left_child.indices = root.indices[:midpoint]
                left_child.children = root.children[:midpoint+1]
                right_child.indices = root.indices[midpoint+1:]
                right_child.children = root.children[midpoint+1:]

            new_index = root.indices[midpoint]

            new_root = BTreeNode(self.degree, is_leaf=False, is_root=True)
            new_root.indices.append(new_index)
            new_root.children.append(left_child)
            new_root.children.append(right_child)

            self.root = new_root





    def remove(self, x):
        self.root.remove(x)
        if not len(self.root):
            self.root = self.root.children[0]
            self.root.is_root = True

    def find(self, x):
        return self.root.find(x)

    def __iter__(self):
        return iter(self.root)

    def iter_range(self, min_index=None, max_index=None):
        return self.root.iter_range(min_index, max_index)


@attr.s
class BTreeNode:
    degree = attr.ib()
    indices = attr.ib(default=attr.Factory(list))
    children = attr.ib(default=attr.Factory(list))
    next_leaf = attr.ib(default=None)
    prev_leaf = attr.ib(default=None)
    is_root = attr.ib(kw_only=True, default=False)
    is_leaf = attr.ib(kw_only=True, default=False)

    def __len__(self):
        return len(self.indices)

    def target_child(self, x):
        idx = bisect.bisect(self.indices, x)
        return self.children[idx]

    def split(self, child):
        midpoint = len(child.indices) // 2
        popped_index = child.indices[midpoint]
        left_child = BTreeNode(self.degree, is_leaf=child.is_leaf)
        right_child = BTreeNode(self.degree, is_leaf=child.is_leaf)

        left_child.prev_leaf = child.prev_leaf
        left_child.next_leaf = right_child
        right_child.prev_leaf = left_child
        right_child.next_leaf = child.next_leaf

        if child.prev_leaf:
            child.prev_leaf.next_leaf = left_child


        if child.next_leaf:
            child.next_leaf.prev_leaf = right_child

        if child.is_leaf:
            left_child.indices = child.indices[:midpoint]
            left_child.children = child.children[:midpoint]
            right_child.indices = child.indices[midpoint:]
            right_child.children = child.children[midpoint:]

        else:
            left_child.indices = child.indices[:midpoint]
            left_child.children = child.children[:midpoint+1]
            right_child.indices = child.indices[midpoint+1:]
            right_child.children = child.children[midpoint+1:]

        new_index = bisect.bisect(self.indices, popped_index)
        self.indices.insert(new_index, popped_index)
        self.children[new_index] = left_child
        self.children.insert(new_index + 1, right_child)

        return len(self.indices) > 2 * self.degree

    def insert(self, x, data):
        if self.is_leaf:
            new_index = bisect.bisect(self.indices, x)
            self.indices.insert(new_index, x)
            self.children.insert(new_index, data)

            return len(self.indices) > 2 * self.degree

        child = self.target_child(x)
        insert_result = child.insert(x, data)

        if insert_result:
            return self.split(child)

        return False

    def merge(self, left, right, idx):
        new_child = BTreeNode(self.degree, is_leaf=left.is_leaf)
        new_child.indices = left.indices + right.indices
        new_child.children = left_child.children[:-1] + r

    def remove(self, x):
        if self.is_leaf:
            target_index = self.indices.index(x)    # propagate exception
            self.indices.pop(target_index)
            self.children.pop(target_index)
            return not self.is_root and len(self.indices) < self.degree

        child = self.target_child(x)
        if not child.remove(x):
            return False

        idx = bisect.bisect(self.indices, x)
        if idx > 0 and len(self.children[idx-1]) > self.degree:
            left = self.children[idx-1]
            shift_idx = left.indices.pop()
            shift_child = left.children.pop()
            child.indices.insert(0, shift_idx)
            child.children.insert(0, shift_child)
            self.indices[idx-1] = child.indices[0]
            return False

        if idx < len(self) - 1 and len(self.children[idx+1]) > self.degree:
            right = self.children[idx+1]
            shict_idx = right.indices.pop(0)
            shift_child = right.children.pop(0)
            child.indices.append(shift_idx)
            child.children.append(shift_child)
            self.indices[idx] = right.indices[0]
            return False

        # have to merge
        # ensure than idx is between left and right
        if idx < len(self) - 1:
            left = self.children[idx]
            right = self.children[idx+1]

        else:
            left = self.children[idx-1]
            right = self.children[idx]
            idx -= 1

        new_child = BTreeNode(self.degree, is_leaf=child.is_leaf)
        new_child.indices = left.indices + [self.indices[idx]] + right.indices
        new_child.children = left.children + right.children
        if left.prev_leaf:
            left.prev_leaf.next_leaf = new_child

        if right.next_leaf:
            right.next_leaf.prev_leaf = new_child

        new_child.prev_leaf = left.prev_leaf
        new_child.next_leaf = right.next_leaf

        self.children.pop(idx)
        self.chldren[idx] = new_child
        self.indices.pop(idx)

        return not self.is_root and len(self) < self.degree

    def find(self, x):
        if self.is_leaf:
            for idx, child in zip(self.indices, self.children):
                if idx >= x:
                    return child

            return self.children[-1]

        return self.target_child(x).find(x)

    def __iter__(self):
        return self.iter_range()

    def iter_range(self, min_index=None, max_index=None):
        if self.is_leaf:
            for idx, child in zip(self.indices, self.children):
                if min_index is not None and idx < min_index:
                    continue

                if max_index is not None and idx > max_index:
                    return

                yield child

            if self.next_leaf:
                yield from self.next_leaf.iter_range(min_index, max_index)

        else:
            if min_index is None:
                yield from self.children[0].iter_range(min_index, max_index)
            else:
                yield from self.target_child(x).iter_range(min_index, max_index)
