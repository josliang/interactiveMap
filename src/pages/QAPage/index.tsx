import React from 'react';

import './style.less';

// 文档数据类型
interface GuideItem {
  id: number;
  title: string;
  content: string;
  images?: string[]; // 内容中的图片URL数组
  type?: 'normal' | 'important' | 'warning'; // 内容类型
}

const GuideDocumentation: React.FC = () => {
  const guideItems: GuideItem[] = [
    {
      id: 1,
      title: '网页的使用方式',
      content: '',
      images: ['images/usageIntro.webp'],
    },
    {
      id: 2,
      title: '如何选择塔科夫截图目录？',
      content: `点击左侧的我的文档，或者手动选择在资源管理器中打开<span class="info">%UserProfile%\\Documents</span>，
      选择<span class="info">%UserProfile%\\Documents\\Escape from Tarkov\\Screenshots</span>目录，
      在弹出的对话框中点击授权访问您的截图目录。<br/>后面使用时无需重新选择，
      如果发现选择了错误的目录可以在<span class="info">设置</span>中点击<span class="warning">重置目录</span>按钮即可重新选择。
      `,
    },
    {
      id: 3,
      title: '如何选择塔科夫游戏目录？',
      content: `找到您的游戏目录，例如：<span class="info">C:\\Games\\EFT</span>。在弹出的对话框中点击授权访问您的游戏目录。
      <br/>后面使用时无需重新选择，如果发现选择了错误的目录可以在<span class="info">设置</span>中点击<span class="warning">重置目录</span>按钮即可重新选择。`,
    },
    {
      id: 4,
      title: '多设备之间如何同步？',
      content: `在设置中可以修改您的用户名，在您进行位置标记后会将您的用户名和位置同步到其他用户的地图中。
      <br/>相同的用户名会被视为同一个用户，如果多个用户使用相同的用户名会在位置同步时会产生冲突，因此尽量<span class="error">避免和其他人使用相同的用户名</span>。
      <br/>当您在多个设备（手机、平板）设置好您相同的用户名后，您在PC端网页进行位置标记时会同步标记到其他设备的地图中，进入战局时其他设备的地图也会同步切换。
      `,
    },
    {
      id: 5,
      title: '游戏把网页覆盖了无法更新位置？',
      content: `当您将网页最小化或覆盖隐藏后，您与服务器的连接将会断开，无法将您的实时位置同步到其他玩家的地图，也无法接收其他玩家的位置和标记。
      <br/>建议使用两个屏幕以获得最佳体验，游戏运行时网页移到另一个屏幕使用。如果您只有一个屏幕或需要隐藏网页，您需要打开<span class="info">画中画</span>功能保证与服务器的正常连接。如果您不需要看<span class="info">画中画</span>的内容，您可以将窗口可以拖到屏幕边缘，但请<span class="error">不要关闭窗口</span>。
      在画中画开启期间浏览器的隐藏不会导致与服务器的连接断开。`,
    },
    {
      id: 6,
      title: '展现你的战术能力',
      content: `右上角的画笔、橡皮功能可以让互动地图立刻成为你们的战术指挥工具。<br/>
      右键点击画笔可以调整画笔的粗细、颜色等参数。<br/>
      右键点击橡皮可以调整橡皮的大小，清除线条`,
    },
    {
      id: 7,
      title: '其他设置',
      content: '您可以在设置中开启<span class="info">删除截图</span>，网页会自动删除截图文件，以节省硬盘空间。',
    },
  ];

  return (
    <div className="guide-doc">
      {/* 顶部标题 */}
      <header className="guide-doc-header">
        <div className="guide-header-content container">
          <p className="guide-title">文章详情</p>
          <p className="guide-subtitle">这篇文章将为您讲解“逃离塔科夫·互动地图”的基本使用方法。</p>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="guide-main">
        <div className="container">
          {/* 按分类展示内容 */}
          {guideItems.map((item) => (
            <article
              key={item.id}
              className="guide-item"
            >
              <div className="item-header">
                <h2 className="item-title">
                  {item.title}
                </h2>
              </div>
              <div className="item-content">
                <p dangerouslySetInnerHTML={{ __html: item.content }} />
                {/* 图片展示 */}
                {item.images && item.images.length > 0 && (
                  <div className="item-images">
                    {item.images.map((img) => (
                      <div key={img} className="image-container">
                        <img
                          src={img}
                          alt={'说明图片'}
                          className="item-image"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GuideDocumentation;
