import matplotlib.pyplot as plt
import functions as fns
import pprint, datetime, time, re, os, sys

botID, ids = "100037995232874", {"1625123677588057" : "Gaffs 2.2", "2080008468694327" : "Gaffs 1.1"}

if sys.argv[1].lower() == "messages":
    fns.leaderboard(sys.argv[2], ids, botID, "messages")
elif sys.argv[1].lower() == "reactions":
    fns.leaderboard(sys.argv[2], ids, botID, "reactions")

# fns.dataGraphs(ids[0], botID)
