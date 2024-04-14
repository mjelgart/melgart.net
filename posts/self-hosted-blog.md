---
title: 'Moving the site to GitHub Pages and Next.js'
date: '2023-10-31'
---

I'm relaunching my personal site. I had been meaning to look for a better solution for some time, as the old blog had a few issues. It didn't look great, since I was using the Wordpress personal hosting tier, which does not allow much CSS customization. Also while I had defintely saved some money by switching from a fully self-hosted install at an overpriced hosting site to the personal Wordpress.com tier, I was still paying $50 a year. While not a ton of money, it seemed ridiculous to be a real coder but then pay someone else to host my site with a CMS with a bunch of advanced features locked behind higher price tiers when I could just write the code directly. 

Given this problem and the desire to fix it, I took on this mini-project and have decided to document it here. 

# LLMs Figuring out the current Webdev Landscape

Naturally, the first thing I did was to ask ChatGPT. 
![image](https://github.com/mjelgart/melgart.net/assets/1152423/4a439e31-c108-48c1-baa5-571d6d6e9742)

It's a pretty solid answer. I had heard of Github Pages before and figured I'll just go check it out given it's free anyway, and I'd be using GitHub to host my code. 

# Dev Environment

I had been planning to use Windows Subsystem for Linux (my home PC is still running Windows for gaming), but before I waded into setting up an SSH key with the git repo, I noticed GitHub gives you a bunch of free hours every month for GitHub Codespaces. These are cloud development environments that are spun up on demand. This is what we've been using at Meta since before I've been there. 

It has the benefit of not having to care if you mess up the dev environment since you can just blow it away and build a new one quickly. It also meant that if I wanted to hang out on the couch with my family instead of on my big PC in my office, I could just grab my laptop, open the codespace I was just using with VS Code on my laptop and then just continue coding. It looks like I've used about 30 of the 120 core-hours available per month. Since the lowest tier has 2 cores, that works out to 15 out of 60 hours available. If you do run out of time, you can tag on extra hours at 36 cents / hour, or, you know, just develop it in WSL like I had planned originally. 

# Writing the Code

It had been a while since I'd worked on a small and simple React project. I initially reached for the Create React App tool as that was the way to go the last time I had tried building a new React site. Interestingly I learned that Create React App was now considered deprecated. Digging into things a bit deeper, it seems there has been some controversy surrounding the Next.js framework, but nonetheless I figured for a small personal site it would be fine. 

Next.js actually has [a pretty good demo](https://nextjs.org/learn-pages-router/basics/create-nextjs-app) to get you familiar with the framework and it's even made by setting up blog posts as markdown files. Since this was 90% of what I wanted to do anyway, I followed the tutorial which uses the `remark` and `remark-html` libraries and then made some tweaks. 

My review of Next.js is that it seems pretty solid. I understand the underlying [Holy War](https://gwern.net/holy-war) dynamics, so I'll just say that compared with the older Create React App,  the built in pre-rendering and routing is all very nice and probably saved me some code. 

Other tweaks included adding the Creative Commons licensing, changing the fonts, updating the CSS, and adding some additional sections to the homepage. Doubtless there will continue to be changes into the future, but since I have the raw source code and don't have to rely on 

# Deployment

This ended up being more involved than I had hoped from GitHub Pages. I had to create a custom GitHub Actions template. I based it mostly off of [this blog post](https://www.viget.com/articles/host-build-and-deploy-next-js-projects-on-github-pages/), but see the [actual yaml file](https://github.com/mjelgart/melgart.net/blob/behind-the-scenes-blog/.github/workflows/build-and-deploy.yml) for the raw code. Nonetheless, it seemed to work, with the exception that Next.js could not understand where my images were stored with GitHub Pages unexpected way of setting up the base url (it's USERNAME.github.io/REPO-NAME not just USERNAME.github.io). 

However, this was fixed once I got the custom domain working working. 

# Custom Domain

Unfortunately, with the unexpected demise of Google Domains, I'm also doing a domain name migration at the same time. I'm using Cloudflare. I appreciate the strong security, and indeed that was my primary motivation, the ease of use is significantly lacking compared to Google Domains. I'm not a DNS expert, and Google Domains meant I didn't have to be. Unfortunately, Cloudflare requires a lot more expert knowledge. 

I had some trouble with this part, but I reached out to ChatGPT again and it helped me troubleshoot the issue. I used [Spencer Greenberg's recommended](https://twitter.com/SpencrGreenberg/status/1717169489647739370) instructions to get the most out of ChatGPT, and it really seemed to do the trick. It guided me through the troubleshooting and also had helpful recommendations along the way. I'm not sure I'll ever be able to program without a LLM again TBH. 

That brings us to the present. Hopefully this post can help anyone else that wants to do something similar. I've found the project to be reinvigorating after basically writing code exclusively as a professional for the past year or two. Programming is fun again! 
