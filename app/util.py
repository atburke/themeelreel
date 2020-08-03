import hashlib


def hash_password(pw, salt):
    hasher = hashlib.sha256()
    hasher.update(f"{pw}{salt}".encode())
    return hasher.hexdigest()


def average_price(ingredients):
    """
    Assumes ingredients is a list of tuples of the form (quantity, units).
    It assumes all items in ingredients are of the same type.
    Returns the average ingredient price as a float and the unit as a string.
    """
    # Empty case
    if not ingredients:
        return (0, '')

    ureg = UnitRegistry()
    # Check if unit exists in registry. If not, skip.
    quantities = [ureg.Quantity(i[0], i[1]) for i in ingredients if i[1] in ureg]
    item_units = [item.units for item in quantities]
    # Determine most frequent unit in list. This will be our unit basis.
    freq_unit = max(set(item_units), key=item_units.count)
    return (sum([i.to(freq_unit).magnitude for i in quantities])/len(quantities), str(freq_unit))