

export interface SbomData {
  fileName: string;
  uploader: string;
  uploadTime: string;
  status: '待评审' | '已解析' | '评审中' | '已完成';
  version: string;
  format: string;
  componentsCount: number;
  licenseTypes: number;
}

export interface Component {
  name: string;
  version: string;
  license: string;
  supplier: string;
  type: string;
  description: string;
}

