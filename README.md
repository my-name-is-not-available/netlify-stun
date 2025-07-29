## 基于Vercel的神金STUN反代
这个是Vercel端，负责向源站( https://origin.robnot.us.kg )请求，并将重定向的结果返回给客户端
## 相较于直接使用cloudflare，这个方法有什么优点？
首先是Vercel配完优选IP以后大陆访问肯定是比直连cloudflare要快亿点点的

其次呢，cloudflare那个面板加载的死慢，每次添加新域都要等好久，非常容易把人给等似，这个方法只需要用api向cloudflare添加一条dns解析，然后在vercel添加域名就能用了，似掉的概率大大减小（甚至可以添加泛解析，一劳永逸）
## 那么这么难绷的项目，如何使用呢？
开始前，默认你已经配置好了基于stun穿透的web服务，并能正确解析dns记录

首先fork这个项目（主要文件被我扔到release分支里了QWQ），把/api/proxy.js里的域名改成`https://origin.你的域名.com`，然后扔到Vercel上，绑上域名

接着在cloudflare添加一条`https://origin.你的域名.com`的dns记录，小黄云打开

在cf的规则部分，添加重定向规则，表达式：`(http.host eq "origin.你的域名.com")`，重定向选择动态，规则`concat(wildcard_replace(http.request.headers["x-original-host"][0],"*.你的域名.com","https://${1}.stun.你的域名.com:端口"),http.request.headers["x-original-path"][0])`

接下来，按照https://b23.tv/seb2ztX 中提供的方法，抓包并保存到lucky的webhook（绝对不是某人懒不想写）

最后效果：a.你的域名.com --> stun.a.你的域名.com，b.你的域名.com --> stun.b.你的域名.com，且其他没有绑定到vercel的域名不受影响
