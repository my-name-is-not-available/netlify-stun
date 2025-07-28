// 设置源站URL，请替换为你的源站地址
const ORIGIN_URL = "http://221.226.197.181:25803";

export default async (request: Request) => {
  // 获取客户端请求的URL
  const url = new URL(request.url);
  // 获取客户端请求的路径（包括查询参数）
  const path = url.pathname + url.search;

  // 构造目标URL
  const targetUrl = ORIGIN_URL + path;

  // 复制原始请求的headers
  const headers = new Headers(request.headers);

  // 设置Host头为源站的主机名（注意：不要包含协议和端口，除非源站需要）
  const originHost = new URL(ORIGIN_URL).host;
  headers.set("Host", originHost);

  // 设置X-Forwarded-Host为客户端请求的Host
  headers.set("x-original-host", url.host);

  // 我们也可以设置X-Forwarded-Proto，因为客户端可能使用https或http
  headers.set("x-original-path", path);

  // 还可以设置其他头，如X-Forwarded-For等，但注意Netlify可能已经设置了一些

  // 修改请求，指向目标URL
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: "manual", // 让代理处理重定向
  });

  try {
    // 发送请求到源站
    const response = await fetch(proxyRequest);

    // 可选：修改响应头，例如添加CORS头或者移除源站的一些头
    const responseHeaders = new Headers(response.headers);
    // 确保不缓存代理的响应（如果需要的话）
    responseHeaders.set("Cache-Control", "no-store");

    // 返回响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response("Proxy error: " + error.message, { status: 500 });
  }
};
