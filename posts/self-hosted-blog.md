---
title: 'Moving the site to Github Pages and Nextjs'
date: '2023-10-27'
---

I'm relaunching my personal site. I had been meaning to look for a better solution for some time, as the old blog had a few issues. It didn't look great, since I was using the Wordpress personal hosting tier, which does not allow much CSS customization. Also while I had defintely saved some money by switching from a fully self-hosted install at an overpriced hosting site to the personal Wordpress.com tier, I was still paying $50 a year. While not a ton of money, it seemed ridiculous to be a real coder but then pay someone else to host my site with a CMS with a bunch of advanced features locked behind higher price tiers when I could just write the code directly. 

Given this problem and the desire to fix it, I took on this mini-project and have decided to document it here. 

# LLMs Figuring out the current Webdev Landscape

Naturally, the first thing I did was to ask ChatGPT. 
![image](https://github.com/mjelgart/melgart.net/assets/1152423/4a439e31-c108-48c1-baa5-571d6d6e9742)

It's a pretty solid answer. I had heard of Github Pages before and figured I'll just go check it out given it's free anyway, and I'd be using GitHub to host my code. 

# React Frameworks

It had been a while since I'd worked on a small and simple React project. I initially reached for the Create React App tool as that was the way to go the last time I had tried building a new React site. Interestingly I learned that Create React App was now considered deprecated. Digging into things a bit deeper, it seems there has been some controversy surrounding the Next.js framework, but nonetheless I figured for a small personal site it would be fine. 

Next.js actually has [a pretty good demo](https://nextjs.org/learn-pages-router/basics/create-nextjs-app) to get you familiar with the framework and it's even made by setting up blog posts as markdown files. Since this was 90% of what I wanted to do anyway, I followed the tutorial which uses the `remark` and `remark-html` libraries and then made some tweaks. 



https://www.viget.com/articles/host-build-and-deploy-next-js-projects-on-github-pages/
