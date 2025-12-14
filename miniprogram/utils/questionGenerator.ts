/**
 * 题目生成工具
 * 根据展馆导览文案生成选择题
 */

import { questionExplanations } from './questionExplanations';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 正确答案的索引 (0-3)
  hallId: string;
  hallName: string;
  explanation: string; // 解析
}

/**
 * 从展馆数据生成题目
 */
export function generateQuestionsFromHalls(halls: any[]): Question[] {
  const questions: Question[] = [];
  
  halls.forEach((hall) => {
    if (!hall.detail) return;
    
    // 从每个展馆的detail中提取关键信息生成题目
    const hallQuestions = generateQuestionsFromHall(hall);
    questions.push(...hallQuestions);
  });
  
  // 随机打乱题目顺序
  return shuffleArray(questions);
}

/**
 * 为题目添加解析
 */
function addExplanationToQuestion(question: Partial<Question>): Question {
  const explanation = questionExplanations[question.id || ''] || '暂无解析';
  return {
    ...question,
    explanation,
  } as Question;
}

/**
 * 从单个展馆生成题目
 */
function generateQuestionsFromHall(hall: any): Question[] {
  const questions: Question[] = [];
  const detail = hall.detail || '';
  const name = hall.name || '';
  const id = hall.id || '';
  
  // 根据展馆名称和内容生成特定题目
  switch (id) {
    case '1': // 古代监狱
      questions.push(
        {
          id: `q_${id}_1`,
          question: '古代监狱的四个代表性雏形不包括以下哪一项？',
          options: ['丛棘', '圜土', '夏台', '廷尉狱'],
          correctAnswer: 3,
          hallId: id,
          hallName: name,
          explanation: questionExplanations[`q_${id}_1`] || '廷尉狱是秦汉时期的中央监狱名称，不是早期监狱雏形。',
        },
        {
          id: `q_${id}_2`,
          question: '羑里城是哪个经典著作的诞生地？',
          options: ['《周易》', '《尚书》', '《周礼》', '《唐律疏议》'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '秦汉时中央监狱被称为？',
          options: ['大理寺狱', '御史台狱', '廷尉狱', '班房'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_4`,
          question: '古代监狱的治理思想"恤刑慎杀"源头可溯至？',
          options: ['《周易》《尚书》', '《尚书》《周礼》', '《周礼》《唐律疏议》', '《唐律疏议》《大清律例》'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_5`,
          question: '被尊为狱神的是？',
          options: ['文王', '皋陶', '文天祥', '赵舒翘'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_6`,
          question: '悯囚制度的功能主要是？',
          options: ['济粮和济药', '平反冤案', '梳理积压案件', '公正判决'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
      );
      break;
      
    case '2': // 近代狱制改良
      questions.push(
        {
          id: `q_${id}_1`,
          question: '被称为"中国监狱改良之父"的是？',
          options: ['张之洞', '沈家本', '小河滋次郎', '梁启超'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_2`,
          question: '沈家本提出的监狱理念是？',
          options: ['监狱非苦人辱人之处，乃教人向善之所', '惩戒与教化并重', '中体西用', '教工艺、促自新'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '《大清监狱律草案》的制定时间？',
          options: ['1900年', '1905年', '1910年', '1912年'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_4`,
          question: '保定习艺所的宗旨是？',
          options: ['教工艺、促自新', '惩戒与教化并重', '中体西用', '屋舍洁净、食物精美'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_5`,
          question: '新式监狱普遍采用的布局不包括？',
          options: ['放射状（轮辐式）', '十字形', '圆形', '以上都采用'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_6`,
          question: '《中华民国监狱规则》颁行于？',
          options: ['1912年', '1928年', '1937年', '1945年'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
      );
      break;
      
    case '3': // 革命根据地时期的监狱
      questions.push(
        {
          id: `q_${id}_1`,
          question: '被誉为"中国劳动改造教育感化制度创始人"的是？',
          options: ['毛泽东', '梁柏台', '党鸿魁', '邵天任'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_2`,
          question: '劳动感化院着重于哪三大教育改造？',
          options: ['文化教育、政治教育、劳动教育', '文化教育、道德教育、法制教育', '政治教育、劳动教育、技能教育', '文化教育、心理教育、劳动教育'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '中央第一劳动感化院是？',
          options: ['中国共产党成立全国性政权后的首座大型监狱', '革命根据地的第一所监狱', '陕甘宁边区的第一所监狱', '抗日战争时期的第一所监狱'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_4`,
          question: '"党鸿魁经验"的核心是？',
          options: ['尊重犯人人格、教育与生产结合', '文化教育、政治教育和劳动教育', '惩戒与教化并重', '教工艺、促自新'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_5`,
          question: '中国共产党领导下的第一所城市监狱是？',
          options: ['中央第一劳动感化院', '陕甘宁边区高等法院监狱', '哈尔滨监狱', '瑞金劳动感化院'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
      );
      break;
      
    case '4': // 新中国劳改工作的开创与发展
      questions.push(
        {
          id: `q_${id}_1`,
          question: '《中国人民政治协商会议共同纲领》明确提出？',
          options: ['强迫他们在劳动中改造自己，成为新人', '改造第一，生产第二', '三个为了', '两个结合'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_2`,
          question: '共和国第一座劳改农场是？',
          options: ['浙江乔司农场', '北京清河农场', '抚顺战犯管理所', '上海提篮桥监狱'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '到1951年全国劳改单位达多少个？',
          options: ['1000个', '2000个', '2452个', '3000个'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_4`,
          question: '新中国首部监狱法规是？',
          options: ['《劳动改造条例》', '《监狱法》', '《大清监狱律草案》', '《中华民国监狱规则》'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_5`,
          question: '被改造的战犯回国后成立的"中归联"于哪年出版《三光》？',
          options: ['1955年', '1957年', '1960年', '1965年'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_6`,
          question: '末代皇帝溥仪在哪个战犯管理所接受改造？',
          options: ['抚顺战犯管理所', '北京清河农场', '浙江乔司农场', '哈尔滨监狱'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
      );
      break;
      
    case '5': // 改革开放与社会主义建设时期劳改工作的创新
      questions.push(
        {
          id: `q_${id}_1`,
          question: '"三分工作"模式的主要内容为？',
          options: ['分押、分管、分教', '分类、分级、分教', '分押、分级、分管', '分类、分管、分教'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_2`,
          question: '全国第一所被命名的特殊学校是？',
          options: ['北京清河农场', '潍坊劳改支队', '浙江乔司农场', '上海提篮桥监狱'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '"三个延伸"不包括？',
          options: ['向前延伸', '向外延伸', '向后延伸', '向上延伸'],
          correctAnswer: 3,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_4`,
          question: '《中华人民共和国监狱法》的颁布标志着？',
          options: ['我国监狱工作进入了全面法制化、规范化的轨道', '监狱体制改革开始', '创建现代化文明监狱', '监狱布局调整开始'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_5`,
          question: '监狱布局调整的目的是？',
          options: ['将偏远监狱向大中城市和交通干线周边转移', '扩大监狱规模', '减少监狱数量', '提高监狱安全'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
      );
      break;
      
    case '6': // 新时期监狱工作的开拓与发展
      questions.push(
        {
          id: `q_${id}_1`,
          question: '现代监狱的纠纷化解机制特点是？',
          options: ['网格化、全覆盖', '集中化、专业化', '分散化、个性化', '标准化、规范化'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_2`,
          question: '对未成年犯的改造主要保障其？',
          options: ['受教育权和发展权', '劳动权和发展权', '受教育权和劳动权', '发展权和健康权'],
          correctAnswer: 0,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '对女犯主要采取的方法不包括？',
          options: ['心理矫治', '艺术矫治', '手工艺培训', '体力劳动'],
          correctAnswer: 3,
          hallId: id,
          hallName: name,
        },
      );
      break;
      
    case '7': // 新时代中国监狱的历史性变革
      questions.push(
        {
          id: `q_${id}_1`,
          question: '总体国家安全观首次提出的时间是？',
          options: ['2012年4月15日', '2014年4月15日', '2016年4月15日', '2018年4月15日'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_2`,
          question: '治本安全观是由谁提出的？',
          options: ['习近平', '张军', '孟建柱', '周强'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '2018年春节，多少名罪犯离监探亲全部按时返回？',
          options: ['500多名', '700多名', '900多名', '1000多名'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
      );
      break;
      
    case '8': // 铸就忠诚警魂
      questions.push(
        {
          id: `q_${id}_1`,
          question: '警衔制度诞生于？',
          options: ['1990年', '1992年', '1995年', '2000年'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_2`,
          question: '现行的警衔制度共分为？',
          options: ['4等10级', '5等13级', '6等15级', '5等12级'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_3`,
          question: '雷马屏监狱建立于？',
          options: ['1950年', '1952年', '1954年', '1956年'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_4`,
          question: '"红烛"精神宣传教育活动全面开展于？',
          options: ['2000年', '2002年', '2004年', '2006年'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_5`,
          question: '塘格木地震发生于？',
          options: ['1988年4月26日', '1990年4月26日', '1992年4月26日', '1994年4月26日'],
          correctAnswer: 1,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_6`,
          question: '汶川地震中，阿坝监狱紧急转移罪犯的行程是？',
          options: ['10000公里', '12000公里', '13000公里', '15000公里'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_7`,
          question: '吴秋瑾同志带队驰援武汉抗疫奋战了多少天？',
          options: ['45天', '50天', '53天', '60天'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
        {
          id: `q_${id}_8`,
          question: '浙江省女子监狱实现监管安全"零事故"多少年？',
          options: ['30年', '35年', '40年', '45年'],
          correctAnswer: 2,
          hallId: id,
          hallName: name,
        },
      );
      break;
  }
  
  return questions;
}

/**
 * 随机打乱数组
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 从题目列表中随机选择指定数量的题目
 */
export function selectRandomQuestions(questions: Question[], count: number = 10): Question[] {
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

