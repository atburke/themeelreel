import hashlib


def hash_password(pw, salt):
    hasher = hashlib.sha256()
    hasher.update(f"{pw}{salt}".encode())
    return hasher.hexdigest()[:50]


def online_stats(data):
    """
    Calculates mean and variance in one pass.
    https://math.stackexchange.com/questions/198336/how-to-calculate-standard-deviation-with-streaming-inputs
    """
    means = [0] * len(data)
    variances = [0] * len(data)
    M2 = 0.0

    for i, x in enumerate(data):
        if i == 0:
            means[i] = x

        else:
            delta = x - means[i-1]
            means[i] = delta / (i + 1)
            M2 += delta * (x - means[i])
            variances[i] = M2 / i

    return means, variances
