export class ResourceOrigin {
  main_markdown_url: string = "";
  extra_yml_urls: string[]|undefined;
  sidebar_yml_url: string|undefined;
  footer_markdown_url: string|undefined;
};

export class ResourceContent {
  main_markdown_blob: string = "";
  sidebar_yml: string = "";
  extra_ymls: string[] = [];
  footer_blob: string|undefined;
};

export async function FetchMarkdownResources(params: ResourceOrigin) {
  params.extra_yml_urls = params.extra_yml_urls ?? [];
  const ret = new ResourceContent;
  ret.extra_ymls = new Array(params.extra_yml_urls.length);
  const promises: Promise<void>[] = [];
  // 获取 Markdown 文件
  const markdown_promise =
  fetch(params.main_markdown_url)
    .then(response => response.text())
    .then(text => {
      ret.main_markdown_blob = text;
    })
    .catch(e => {
      console.error(e);
    });
  promises.push(markdown_promise);

  // 获取元数据文件
  const metadata_promises = params.extra_yml_urls.map((url, i) =>
    fetch(url)
      .then(response => response.text())
      .then(text => {
        ret.extra_ymls[i] = text;
      })
      .catch(e => {
        console.error(e)
      })
  );
  promises.push(...metadata_promises);

  // 获取边栏文件
  if (params.sidebar_yml_url) {
    const promise = fetch(params.sidebar_yml_url)
    .then(response => response.text())
    .then(text => {
      ret.sidebar_yml = text;
    });
    promises.push(promise);
  }

  if (params.footer_markdown_url) {
    const promise = fetch(params.footer_markdown_url)
    .then(response => response.text())
    .then(text => {
      ret.footer_blob = text;
    });
    promises.push(promise);
  }

  // 等待所有请求返回
  await Promise.all(promises);
  return ret;
}

export function FetchFromSingleURL(url?: string): Promise<string>
{
  if (!url) {
    return Promise.resolve("");
  }
  const promise = fetch(url)
  .then(response => response.text());
  return promise;
}

export function FetchFromMultipleURLs(urls: string[]): Promise<string>[]
{
  const promises: Promise<string>[] = new Array(urls.length);
  urls.forEach((url, idx) => {
    if (!url) {
      promises[idx] = Promise.resolve("");
    } else {
      const promise = fetch(url)
      .then(response => response.text());
      promises[idx] = promise;
    }
  });
  return promises;
}
