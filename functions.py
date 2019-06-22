import matplotlib.pyplot as plt
import pprint, datetime, time, re, os

plt.rcParams.update({'font.size': 8})
width, colour = 0.5, '#e74c3c'

def readData(id, botID, type):
    dataR, dataS, dataM, dates = {}, {}, {}, []
    with open("data/" + id + " - {}.txt".format(type.capitalize())) as f:
        for line in f:
            if type.lower() == "messages":
                data = re.match(r'(.*),(.*),(.*),(".*"),(.*),(.*),(\[.*\]),(\{.*\}),(.*),(.*)', line.strip(), re.M|re.I)
                line = [data.group(i) for i in range(1,11)]
                dates.append(getDate(line[-1]))
                sender = "Bot" if line[1] == botID or line[2] == "undefined" else line[2]
                dataM[sender] = dataM[sender] + 1 if sender in dataM else 1
            else:
                line = line.split(",")
                dates.append(getDate(line[-1]))
                sender, receiver = line[4], line[2]
                receiver = "Bot" if line[1] == botID else receiver
                sender = "Bot" if line[3] == botID else sender
                dataR[receiver] = dataR[receiver] + 1 if receiver in dataR else 1
                dataS[sender] = dataS[sender] + 1 if sender in dataS else 1
        if type.lower() == "messages": return dataM, dates
        if type.lower() == "reactions": return dataR, dataS, dates

def leaderboard(id, ids, botID, type):
    if id in ids:
        if type.lower() == "messages":
            dataM, dates = readData(id, botID, type)
            dataM = sortDict(dataM)
            print("Messages".center(30, "-"))
            for n, i in enumerate(dataM):
                print("{}. {} [{}]".format(n + 1, i[0], i[1]))
            print()
        elif type.lower() == "reactions":
            dataR, dataS, dates = readData(id, botID, type)
            dataR, dataS = sortDict(dataR), sortDict(dataS)
            print("Reacts Received".center(30, "-"))
            for n, i in enumerate(dataR):
                print("{}. {} [{}]".format(n + 1, i[0], i[1]))
            print()
            print("Reacts Sent".center(30, "-"))
            for n, i in enumerate(dataS):
                print("{}. {} [{}]".format(n + 1, i[0], i[1]))
    else:
        print("Please use command in either: {}".format([ids[i] for i in ids]))

def drawBar(yData, xData, dates, id, type, figNo):
    plt.figure(figNo)
    plt.barh(yData, xData, width, color = colour)
    plt.ylabel("Users")
    plt.xlabel(type)
    plt.title("{} [{} to {}]".format(type.capitalize(), dates[0], dates[-1]))
    if not os.path.exists("images/" + id): os.mkdir("images/" + id)
    plt.savefig("images/{}/{}.png".format(id, type.capitalize()), bbox_inches = "tight")

def dataGraphs(id, botID):
    dataR, dataS, datesR = readData(id, botID, "Reactions")
    dataM, datesM = readData(id, botID, "Messages")
    ratio = {}
    for i in dataM:
        if i in dataR: ratio[i] = round(dataM[i]/dataR[i], 3)
    dataR, dataS, datesR  = sortDict(dataR), sortDict(dataS), sorted(datesR)
    dataM, datesM = sortDict(dataM), sorted(datesM)
    ratio = sortDict(ratio)
    namesR, scoresR = listData(dataR)
    namesS, scoresS = listData(dataS)
    namesM, scoresM = listData(dataM)
    ratioNames, ratioScores = listData(ratio)
    drawBar(namesR, scoresR, datesR, id, "Reactions Received", 1)
    drawBar(namesS, scoresS, datesR, id, "Reactions Sent", 2)
    drawBar(namesM, scoresM, datesM, id, "Messages Sent", 3)
    drawBar(ratioNames, ratioScores, datesR, id, "Messages : Reactions", 4)

def listData(data):
    names, scores = [], []
    for i in data:
        names.append(i[0])
        scores.append(i[1])
    return names, scores

def getDate(date):
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(date)/1000))

def sortDict(dictionary):
    return sorted(dictionary.items(), key = lambda kv: (kv[1], kv[0]), reverse = True)
