export default async function (params: {
  markdown_url: string,
  extra_metadata_urls: string[] | null
}) {
  params.extra_metadata_urls = params.extra_metadata_urls ?? [];
  const ret = {
    markdown_blob: "",
    extra_metadata: new Array<string>(params.extra_metadata_urls.length)
  };

  // 获取 Markdown 文件
  const markdown_promise =
  fetch(params.markdown_url)
    .then(response => response.text())
    .then(text => {
      ret.markdown_blob = text;
    })
    .catch(e => {
      console.error(e);
    })

  // 获取元数据文件
  const metadata_promises = params.extra_metadata_urls.map((url, i) =>
    fetch(url)
      .then(response => response.text())
      .then(text => {
        ret.extra_metadata[i] = text;
      })
      .catch(e => {
        console.error(e)
      })
  );

  // 等待所有请求返回
  await Promise.all([markdown_promise, ...metadata_promises]);

  return ret;
}
