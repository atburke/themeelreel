import hashlib


def hash_password(pw, salt):
    hasher = hashlib.sha256()
    hasher.update(f"{pw}{salt}".encode())
    return hasher.hexdigest()
