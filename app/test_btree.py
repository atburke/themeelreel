from hypothesis import given
import hypothesis.strategies as st

from app.btree import BPlusTree
import random


@given(st.lists(st.integers(), unique=True))
def test_insert(a):
    tree = BPlusTree(5)
    for i in a:
        tree.insert(i, i)

    output = list(iter(tree))
    assert output == sorted(a), len(tree.root)


@given(st.lists(st.integers()), st.integers())
def test_find(a, x):
    tree = BPlusTree(5)
    for i in a:
        tree.insert(i, i)

    tree.insert(x, x)

    assert tree.find(x) == x
