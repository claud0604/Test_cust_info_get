/**
 * PM2 설정 파일
 * Test_cust_info_get - 고객 정보 조회 서버
 * 포트: 3010
 */

module.exports = {
  apps: [
    {
      name: 'test-cust-info-get',
      script: './server.js',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: '../logs/error.log',
      out_file: '../logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
