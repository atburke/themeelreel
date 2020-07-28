from hypothesis import given
import hypothesis.strategies as st

import math
import statistics

from app.util import *

@given(a=st.lists(st.integers(), min_size=2))
def test_online_stats(a):
    o_mean, o_var = online_stats(a)
    assert math.isclose(o_mean[-1], statistics.fmean(a))
    assert math.isclose(o_var[-1], statistics.variance(a))
