#!/usr/bin/python3
# Genera el archivo data.json

import os
import json

def listPath(path):
    paths = os.listdir(path)
    files = []
    for cpath in paths:
        if (os.path.isdir(cpath)):
            files += listPath(os.path.join(path, cpath))
        else:
            files.append(cpath)

    return files

def main():

    extensions = ["mp3", "wav"]

    currentPath = os.path.split(__file__)[0]

    files = listPath(currentPath)
    finalFiles = []

    for file in files:
        extension = file.split(".")[-1]
        if (extension in extensions):
            finalFiles.append(file)

    with open("data.json", "w+") as f:
        f.write(json.dumps({
            "files": finalFiles
        }, separators=(",", ":")))

    print(f"Creades les dades per a {len(finalFiles)} arxius")


if (__name__ == "__main__"):
    main()