---
title: 'Home Project with ChatGPT: Extending Wi-Fi Coverage in My Apartment' 
date: '2023-11-16'
---

Having undertaken another tech project with the help of ChatGPT, I wanted to put together a quick write up just to document how much easier it was when working with an LLM and not having to track down 10 different reddit posts and documentation manuals myself. And yes, of course ChatGPT wrote up a bunch of this post, but it's been heavily edited by me. 


## The Goal

The initial goal was straightforward: improve the Wi-Fi coverage in my apartment, where the existing Xfinity modem/router combo wasn't delivering good performance, especially in my bedroom at the other end of the apartment. In fact, this problem had grown out of an earlier problem with Xfinity where my internet connection was buggy the entire month of September. In one moment of frustration, I drove to the store and demanded a new modem. While they had promised a "better" one, it appears I was given a defective model with much worse Wi-Fi coverage. 

Aside: I do indeed have my own modem, as all good engineers should, and would typically recommend you own one yourself instead of renting, but Xfinity alleged that my old modem was incompatible with the new type of connection and gave me a deal where I could use their modem combo for free* with a 2 year commitment. Knowing I would be moving in 16 months, a quick calculation meant that it was much cheaper to pay ~$50 at the end of my lease than to buy a whole new modem which was compatible. In retrospect, I would not recommend doing this! The extra benefits you get of knowing who is on your network from the mobile app just isn't that great compared to the cost of just having crappy Wi-Fi.

## Repeaters? Access Points?

I have a totally adequate, unused Wi-Fi 6 router (the TP-Link Archer AX50 AX3000 if you are interested) and I figured I could use an existing long Ethernet cable to attach the router to my network and fix my connectivity issues.  Initially, I considered setting up the Archer AX50 as a repeater. However, after consulting with ChatGPT, I learned that the AX50 does not support Repeater Mode and actually that's not what I wanted anyway. A repeater listens for the Wi-Fi signal and boosts it without any Ethernet connection. An access point is just one Wi-Fi access point of a larger network all connected via Ethernet on the backend. I had already routed a long cable to another room, so I shifted my focus to using it as an access point (but not a router) which is supported.

ChatGPT guided me through setting up the Archer AX50 in Access Point mode. This involved connecting the router to my existing Xfinity network via Ethernet and configuring the wireless settings. The process is super easy (especially with an LLM telling you exactly what menus to open) and soon, I had a working AP, which significantly improved Wi-Fi coverage. Testing revealed that several deadspots in my bedroom went from literally no internet to 300 Mpbs. Success!

## Challenges and Solutions

### Dual-Band Configuration

The Archer AX50 supports both 2.4GHz and 5GHz bands. My Xfinity router/modem combo managed these bands under a single SSID, a feature not directly mirrored in the AX50. ChatGPT had suggested naming them the same SSID and password to simplify access, but I wasn't sure if I should rename both or only one. After consulting again, it advised setting them all to be the same. Now they all appear on all devices as a single network. Pretty neat! Perhaps I should have been naming my 2.4GHz and 5.0GHz the same thing forever? I'll have to ask ChatGPT again later.

### Accessing the Router Admin Panel

After setting up the new access point, I realized I had made a typo in the new SSID. However, accessing the admin panel was tricky since the AX50, in Access Point mode, wasn't routing traffic, and the Xfinity router apparently didn't care that I wanted to talk to the TP-Link device. I was going to get up from my chair and unplug the Ethernet port from the router to see if that would fix it, but I was lazy and asked ChatGPT instead. It suggested two methods: using the tplinkwifi.net domain or finding the AX50's IP address from the Xfinity router's DHCP client list. The latter method worked effectively, and did not require me to get out of my chair (and in retrospect, I'm not sure unplugging it would have worked unless the router switched modes once disconnected).  Very cool. I'm not sure how long it would have taken me to figure out that solution. 


### Desktop PC Connectivity

Despite improved coverage as documented by my now being able to comfortably browse memes on my phone in bed, a desktop PC in the bedroom showed only marginal improvement, likely due to the Wi-Fi antenna's suboptimal positioning. While I tried using a USB adapter, it didn't match the (still crappy) performance of the existing PCIe Wi-Fi card.

Planning to build a new desktop with a motherboard featuring built-in Wi-Fi 5, I explored options for extending the Wi-Fi antenna. ChatGPT found that Wi-Fi antenna extension cables for SMA connectors are compatible with most motherboards, so I will potentially go with that in the future. 

## Conclusion

This project not only improved my Wi-Fi coverage but also reinforced how much easier tech projects are now with LLMs. I know by myself each challenge I ran into would probably have cost me 10-30 minutes on top of the several times I got off track just distracted by testing cables or finding my old Wi-Fi dongles. Moreover, this write up would have taken much longer if I had needed to parse through our whole conversation and go back and forth to this post.  Instead, I just asked for a summary at the end of our discussion in the form of a post and I immediately got a basic version of this writeup--already in markdown format! 

If you're like me and you have a bunch of little tech projects around the house that you've been meaning to look at, try just asking ChatGPT for help! It's so much easier. You spend all your time making progress and anytime you're stumped or you need someone to read some documentation, ChatGPT can handle it for you! Sometimes it even takes a couple minutes, so it literally feels like you have a little helper you can send off on tasks and report back to you. 

It's fascinating and kind of scary. Even throughout this post I feel bad calling ChatGPT "it". I wonder if I should just come up with a name and use that because it literally feels like there's this knowledgable competent person armed with an internet connection and excellent speedreading skills working through the problem with you. 