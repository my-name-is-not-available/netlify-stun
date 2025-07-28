export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  // 获取客户端原始请求信息
  const originalHost = req.headers.get("host") || "";
  const originalPath = new URL(req.url).pathname;
  
  // 设置目标源站URL（替换为你的实际源站）
  const target = "https://origin.robnot.us.kg";
  
  // 克隆原始请求头并添加自定义头
  const headers = new Headers(req.headers);
  headers.set("X-Original-Host", originalHost);
  headers.set("X-Original-Path", originalPath);
  
  // 覆盖Host头确保源站接收正确的主机
  headers.set("Host", new URL(target).host);
  
  // 构造代理请求
  const proxyRequest = new Request(
    target + originalPath + new URL(req.url).search,
    {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "manual" // 不自动处理重定向
    }
  );

  try {
    // 转发请求到源站
    const response = await fetch(proxyRequest);
    
    // 返回源站响应（保留所有原始头）
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
